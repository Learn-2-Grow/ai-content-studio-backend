
export interface JobOptions {
    delay?: number;
    attempts?: number;
    priority?: number;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    timeout?: number;
    jobId?: string;
}
