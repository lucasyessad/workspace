// ============================================================
// TabibPro — Service Messagerie
// Messagerie sécurisée médecin-patient (DB uniquement, pas de WebSocket)
// ============================================================

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagerieService {
  private readonly logger = new Logger(MessagerieService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Liste des conversations de l'utilisateur ----

  async getConversations(userId: string, role: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                medecin: { select: { nomFr: true, prenomFr: true, specialite: true } },
                patient: { select: { nomFr: true, prenomFr: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            contenu: true,
            senderId: true,
            createdAt: true,
            lu: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                lu: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((p) => p.user),
      dernierMessage: conv.messages[0] ?? null,
      nonLus: conv._count.messages,
    }));
  }

  // ---- Messages d'une conversation ----

  async getMessages(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur est participant
    const participation = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participation) {
      throw new ForbiddenException(`Accès à cette conversation refusé`);
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            medecin: { select: { nomFr: true, prenomFr: true } },
            patient: { select: { nomFr: true, prenomFr: true } },
          },
        },
      },
    });

    return messages;
  }

  // ---- Envoyer un message ----

  async sendMessage(dto: SendMessageDto, senderId: string, senderRole: string) {
    // Vérifier que le destinataire existe
    const destinataire = await this.prisma.user.findUnique({
      where: { id: dto.destinataireId },
      select: { id: true, role: true },
    });

    if (!destinataire) {
      throw new NotFoundException(`Destinataire introuvable`);
    }

    // Chercher une conversation existante entre les deux utilisateurs
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: dto.destinataireId } } },
        ],
      },
    });

    // Créer la conversation si elle n'existe pas
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: dto.destinataireId },
            ],
          },
        },
      });
      this.logger.log(
        `Nouvelle conversation créée entre ${senderId} et ${dto.destinataireId}`
      );
    }

    // Créer le message
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        contenu: dto.contenu,
        pieceJointeUrl: dto.pieceJointeUrl ?? null,
        lu: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            medecin: { select: { nomFr: true, prenomFr: true } },
            patient: { select: { nomFr: true, prenomFr: true } },
          },
        },
      },
    });

    // Mettre à jour la date de la conversation
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    this.logger.log(
      `Message envoyé dans conversation ${conversation.id} par ${senderId}`
    );
    return message;
  }

  // ---- Marquer tous les messages comme lus ----

  async marquerLu(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur est participant
    const participation = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participation) {
      throw new ForbiddenException(`Accès à cette conversation refusé`);
    }

    // Marquer les messages non lus (envoyés par d'autres) comme lus
    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        lu: false,
      },
      data: { lu: true },
    });

    this.logger.log(
      `${result.count} message(s) marqué(s) lu(s) dans conversation ${conversationId}`
    );
    return { count: result.count };
  }
}
