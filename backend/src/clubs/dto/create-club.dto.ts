export class CreateClubDto {
  name: string;
  description?: string;
  game?: string;
  logo?: string;
  maxMembers?: number;
  isPublic?: boolean;
}
