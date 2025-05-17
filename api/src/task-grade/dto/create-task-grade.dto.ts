import { IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskGradeDto {
  @ApiProperty({ example: 'user-uuid-123' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'task-uuid-456' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  grade: number;
}
