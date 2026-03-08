// ============================================================
// TabibPro — WebSocket Gateway — File d'Attente
// Diffusion temps réel de la file d'attente du cabinet
// ============================================================

import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/file-attente',
  cors: {
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.PATIENT_PORTAL_URL || 'http://localhost:3002',
    ],
    credentials: true,
  },
})
export class FilAttenteGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FilAttenteGateway.name);
  // Map medecinId → Set de socketIds
  private readonly roomSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('✅ WebSocket File d\'Attente initialisé');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const medecinId = payload.medecinId;

      if (!medecinId) {
        client.disconnect();
        return;
      }

      client.data.medecinId = medecinId;
      const room = `medecin:${medecinId}`;
      client.join(room);

      if (!this.roomSockets.has(medecinId)) {
        this.roomSockets.set(medecinId, new Set());
      }
      this.roomSockets.get(medecinId)!.add(client.id);

      this.logger.log(`Client connecté : ${client.id} (médecin: ${medecinId})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const medecinId = client.data?.medecinId;
    if (medecinId) {
      this.roomSockets.get(medecinId)?.delete(client.id);
    }
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  @SubscribeMessage('get_file_attente')
  handleGetFile(@ConnectedSocket() client: Socket) {
    // Le service RDV enverra la mise à jour via diffuserFileAttente
    client.emit('connected', { status: 'ok' });
  }

  /**
   * Diffuse la file d'attente à tous les clients d'un médecin
   */
  diffuserFileAttente(medecinId: string, file: any[]) {
    const room = `medecin:${medecinId}`;
    this.server.to(room).emit('file_attente_update', {
      timestamp: new Date().toISOString(),
      total: file.length,
      patients: file.map((p, index) => ({
        position: index + 1,
        patientId: p.patientId,
        nom: p.nom,
        heureArrivee: p.heureArrivee,
        attenteMinutes: Math.round((Date.now() - new Date(p.heureArrivee).getTime()) / 60000),
        priorite: p.priorite,
      })),
    });
  }
}
