// ============================================================
// TabibPro — DTO Messagerie
// ============================================================

import { IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsUUID('4')
  destinataireId: string;

  @IsString()
  @MaxLength(2000)
  contenu: string;

  @IsOptional()
  @IsString()
  pieceJointeUrl?: string;
}
