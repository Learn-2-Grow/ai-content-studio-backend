import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import * as csurf from 'csurf';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';


function logStartup(port: any, startupStartTime: bigint): void {

  const startupEndTime = process.hrtime.bigint();
  const totalStartupTime = Number(startupEndTime - startupStartTime) / 1000000;

  // Enhanced startup banner with advanced features
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  const memoryUsage = process.memoryUsage();
  const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const env = process.env.NODE_ENV || 'development';
  const startTime = new Date().toLocaleString();

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                                   ║');
  console.log('║    🤖 AI CONTENT STUDIO - BACKEND 🤖                                              ║');
  console.log('║  ------------------------------------------------------------------------------   ║');
  console.log(`║    🟢 STATUS:   RUNNING             🌐  PORT: ${port.toString().padEnd(30)}      ║`);
  console.log(`║    ⏱️  STARTUP:  ${totalStartupTime?.toFixed(2)}ms${' '.repeat(17 - totalStartupTime?.toFixed(2).length)} 🕐  STARTED: ${startTime.padEnd(27)}      ║`);
  console.log(`║    💻 ENV:      ${env.toUpperCase().padEnd(19)} 🏗️   NODE: ${nodeVersion.padEnd(31)}     ║`);
  console.log(`║    🖥️  PLATFORM: ${platform.padEnd(20)}🏛️   ARCH: ${arch.padEnd(31)}     ║`);
  console.log(`║    💾 MEMORY:   ${memoryMB}MB${' '.repeat(17 - memoryMB.length)} 🎯  ENDPOINT: http://localhost:${port}${' '.repeat(9 - port.toString().length)}      ║`);
  console.log('║                                                                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}


async function bootstrap(): Promise<void> {

  const startupStartTime: bigint = process.hrtime.bigint();

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(helmet());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression());

  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const port = configService.get('APP_PORT');

  await app.listen(port);

  logStartup(port, startupStartTime);
}

bootstrap();
