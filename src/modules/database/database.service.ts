import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
    // Using NestJS built-in Logger (from @nestjs/common)
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@InjectConnection() private connection: Connection) { }

    onModuleInit() {
        this.logger.log('🔄 Attempting to connect to MongoDB...');

        // Connection successful
        this.connection.on('connected', () => {
            this.logger.log('✅ MongoDB connected successfully');
            this.logger.log(`📊 Database: ${this.connection.db?.databaseName || 'N/A'}`);
            this.logger.log(`🌐 Host: ${this.connection.host || 'N/A'}:${this.connection.port || 'N/A'}`);
        });

        // Connection error
        this.connection.on('error', (error) => {
            this.logger.error('❌ MongoDB connection failed');
            this.logger.error(`Error: ${error.message}`);
            this.logger.error('Please check your MONGODB_URI in .env file');
        });

        // Connection disconnected
        this.connection.on('disconnected', () => {
            this.logger.warn('⚠️  MongoDB disconnected');
        });

        // Connection reconnected
        this.connection.on('reconnected', () => {
            this.logger.log('🔄 MongoDB reconnected successfully');
        });

        // Connection timeout
        this.connection.on('timeout', () => {
            this.logger.error('⏱️  MongoDB connection timeout');
            this.logger.error('Please check if MongoDB is running and accessible');
        });

        // Check initial connection state
        if (this.connection.readyState === 1) {
            this.logger.log('✅ MongoDB already connected');
        } else if (this.connection.readyState === 0) {
            this.logger.log('⏳ MongoDB connection pending...');
        }
    }
}
