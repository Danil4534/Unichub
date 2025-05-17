import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(0)
  @Max(100)
  grade: number;
}
