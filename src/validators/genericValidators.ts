import { Model, WhereOptions } from 'sequelize';
import { QueryOptions } from '@models/types/QueryOptions';

export const restrictOnDelete = async function <T extends Model>(
  /**
   * Ensures that a specified record can only be deleted if no related dependent records exist.
   *
   * @template T - A class that extends the Sequelize `Model` class.
   * @param modelToCheck - The Sequelize model constructor to check for dependent records.
   * @param foreignKeyColumn - The column in the dependent model that references the parent record.
   * @param recordId - The ID of the record in the parent model to check for dependencies.
   * @param options - (Optional) Additional query options, such as a transaction.
   *
   * @throws {Error} If dependent records exist, throws an error with the message:
   * "Cannot delete, related records exist."
   *
   * @example
   * import { restrictOnDelete } from './helpers';
   * import { User, Post } from './models';
   *
   * async function deleteUser(userId: number) {
   *   await restrictOnDelete(Post, 'userId', userId);
   *   await User.destroy({ where: { id: userId } });
   * }
   */
  modelToCheck: (new () => T) & typeof Model,
  foreignKeyColumn: string,
  recordId: string | number,
  options?: QueryOptions | null
): Promise<void> {
  const dependentRows = await modelToCheck.count({
    where: { [foreignKeyColumn]: recordId } as WhereOptions<T>,
    ...options
  });
  if (dependentRows > 0) {
    throw new Error('Cannot delete, related records exist.');
  }
};

/**
 * Interface representing a validation function for Sequelize models.
 *
 * This interface defines a contract for a function that performs validation
 * on a given instance of a model and optionally accepts query options (e.g., transactions).
 *
 * @template T - A class extending the Sequelize `Model` class.
 *
 * @param instance - The instance of the model to validate.
 * @param options - (Optional) Additional query options, such as a transaction.
 *
 * @returns A `Promise<void>` that resolves when the validation completes successfully
 * or rejects with an error if validation fails.
 *
 * @example
 * import { validator } from './validators';
 * import { User } from './models';
 *
 * const validateUser: validator<User> = async (user, options) => {
 *   if (!user.name) {
 *     throw new Error('User must have a name.');
 *   }
 * };
 */
export type validator<T extends Model> = (instance: T, options?: QueryOptions | null) => Promise<void>;
