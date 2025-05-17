import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'aws-sdk';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configNest = new DocumentBuilder()
    .setTitle('StudentApp')
    .setDescription('newApplication')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const documentFactory = () => SwaggerModule.createDocument(app, configNest);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
