// ============================================================
// TabibPro — DTOs Médicaments
// ============================================================

import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class SearchInteractionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  ids: string[];
}
