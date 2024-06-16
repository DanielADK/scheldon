import Router from 'koa-router';
import { Room } from '../models/Room';

const router = new Router();

// All rooms
router.get('/rooms', async (ctx) => {
    const { page = 1, limit = 10 } = ctx.query;
    const offset = (Number(page) - 1) * Number(limit);

    const rooms = await Room.findAndCountAll({
        limit: Number(limit),
        offset: offset,
    });

    ctx.body = {
        data: rooms.rows,
        meta: {
            total: rooms.count,
            page: Number(page),
            limit: Number(limit),
        },
    };
});

export default router;
