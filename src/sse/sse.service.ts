import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';


@Injectable()
export class SseService implements OnModuleDestroy {
    private readonly logger = new Logger(SseService.name);
    private connections = new Map<string, Subject<any>>();

    // Subscribe
    subscribe(userId: string): Observable<any> {
        if (!userId) throw new Error('userId required');
        let subj = this.connections.get(userId);
        if (!subj) {
            subj = new Subject<any>();
            this.connections.set(userId, subj);
            this.logger.log(`SSE: created subject for user ${userId}`);
        }
        return subj.asObservable();
    }

    // Emit payload 
    emitToUser(userId: string, payload: any) {
        const subj = this.connections.get(userId);
        if (!subj) {
            this.logger.warn(`SSE: no active connection for user ${userId}, dropping event`);
            return false;
        }
        try {
            subj.next(payload);
            this.logger.log(`SSE: emitted to ${userId}`);
            return true;
        } catch (err) {
            this.logger.error(`SSE emit error for ${userId}: ${err}`);
            return false;
        }
    }

    // Cleanup when the module shuts down
    onModuleDestroy() {
        this.logger.log('SSE: cleaning up subjects');
        for (const [k, s] of this.connections) {
            s.complete();
        }
        this.connections.clear();
    }

    closeUser(userId: string) {
        const subj = this.connections.get(userId);
        if (subj) {
            subj.complete();
            this.connections.delete(userId);
            this.logger.log(`SSE: closed connection for user ${userId}`);
        }
    }
}
