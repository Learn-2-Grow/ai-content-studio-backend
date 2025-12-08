import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IThread, IThreadPagination } from 'src/interfaces/thread.interface';
import { ThreadQueriesDto } from './dto/queries.dto';
import { Thread, ThreadDocument } from './entities/thread.entity';

export class ThreadRepository {
    constructor(
        @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    ) { }

    async create(thread: Partial<IThread>): Promise<IThread> {
        const threadDoc = await this.threadModel.create(thread);
        return threadDoc.toObject();
    }

    async findById(id: any): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const thread = await this.threadModel.findById(idObject).exec();
        return thread?.toObject() || null;
    }

    async findByUserId(userId: string): Promise<IThread[]> {
        const threads = await this.threadModel.find({ userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
        return threads.map(thread => thread.toObject());
    }

    async update(id: any, thread: Partial<IThread>): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const updatedThread = await this.threadModel.findByIdAndUpdate(idObject, thread, { new: true }).exec();
        return updatedThread?.toObject() || null;
    }

    async delete(id: string): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadModel.findByIdAndDelete(idObject).exec();
    }

    async findByIdAndUserId(id: string, userId: any): Promise<IThread | null> {
        const userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        const thread = await this.threadModel.findOne({ _id: id, userId: userIdObjectId }).exec();
        return thread?.toObject() || null;
    }

    async getTotalThreadsByUserId(userId: any): Promise<number> {
        const userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        return this.threadModel.countDocuments({ userId: userIdObjectId }).exec();
    }

    async getThreadCountsByType(userId?: any): Promise<Array<{ _id: string; count: number; threadIds: string[] }>> {


        const aggregate: PipelineStage[] = [];
        if (userId) {
            aggregate.push({ $match: { userId } });
        }
        aggregate.push({
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                threadIds: { $push: { $toString: '$_id' } }
            }
        });

        const threadsByType = await this.threadModel.aggregate(aggregate).exec();

        return threadsByType;
    }

    async findAll(queries: ThreadQueriesDto): Promise<IThreadPagination> {

        const filter: any = {};
        let sortOrder: 1 | -1 = 1;
        if (queries?.sortOrder && queries.sortOrder === 'desc') {
            sortOrder = -1;
        }

        if (queries?.threadIds) {
            filter._id = { $in: queries.threadIds.map(id => NestHelper.getInstance().getObjectId(id)) };
        }
        if (queries?.userId) {

            filter.userId = queries.userId;
        }
        if (queries?.search) {
            // Case-insensitive search on title field
            filter.title = { $regex: queries.search, $options: 'i' };
        }
        if (queries?.status) {
            filter.status = queries.status;
        }
        if (queries?.type) {
            filter.type = queries.type;
        }

        // Parse pagination parameters
        const currentPage = queries?.currentPage ? parseInt(queries.currentPage.toString(), 10) : 1;
        const pageSize = queries?.pageSize ? parseInt(queries.pageSize.toString(), 10) : 10;
        const skip = (currentPage - 1) * pageSize;

        // Use aggregation with $facet to get both count and data in a single database call
        const pipeline: PipelineStage[] = [
            { $match: filter },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    data: [
                        { $sort: { createdAt: sortOrder } },
                        { $skip: skip },
                        { $limit: pageSize },
                    ],
                },
            },
        ];

        const result = await this.threadModel.aggregate(pipeline).exec();

        if (!result || result.length === 0) {
            return {
                data: [],
                total: 0,
                currentPage,
                pageSize,
            };
        }

        const facetResult = result[0] || { total: [], data: [] };
        const total = facetResult.total?.[0]?.count || 0;
        const threadsData: IThread[] = facetResult.data || [];

        const pagination: IThreadPagination = {
            data: threadsData,
            total,
            currentPage,
            pageSize,
        };

        return pagination;
    }
}
