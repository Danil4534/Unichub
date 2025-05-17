import { S3 } from 'aws-sdk';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageManagerService {
  async uploadPublicFile(dataBuffer: Buffer, fileName: string) {
    const s3 = new S3();
    try {
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: dataBuffer,
          Key: `${uuid()}-${fileName}`,
        })
        .promise();
      return uploadResult;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
