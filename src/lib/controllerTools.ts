import { Context } from 'koa';

/**
 * Get ID from string (usually param).
 * @param id string
 * @throws Error if ID is not a number
 */
export const getIdFromParam = async (id: string): Promise<number> => {
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    throw new Error('Invalid ID');
  }
  return idNum;
};

export const handleError = (ctx: Context, error: unknown): void => {
  if (error instanceof Error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  } else {
    ctx.status = 400;
    ctx.body = { error: 'Unexpected error occured.' };
  }
};
