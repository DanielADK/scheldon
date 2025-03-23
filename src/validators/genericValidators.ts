import { Model, WhereOptions } from 'sequelize';

export async function restrictOnDelete<T extends Model>(
  /**
   * Throws an error if there are related rows associated with the specified `id` in the given model.
   *
   * This function is commonly used to enforce referential integrity in cases where records
   * in a database cannot be deleted if dependent/associated records exist.
   *
   * @template T - The type of the Sequelize model extending the "Model" base class.
   * @param {({ new (): T } & typeof Model)} model - The Sequelize model to check for associated records.
   * @param {keyof T} foreignKey - The name of the foreign key column that establishes the relationship.
   * @param {string} id - The identifier to search for in the foreign key column.
   * @throws {Error} Throws an error if dependent records exist in the database.
   * @example
   * import { restrictOnDelete } from './restrictOnDelete';
   * import { User, Post } from './models';
   *
   * async function deleteUser(userId: string): Promise<void> {
   *   // Ensure the user can only be deleted if there are no associated posts
   *   await restrictOnDelete(Post, 'userId', userId);
   *   // If no error is thrown, we can safely delete the user
   *   await User.destroy({ where: { id: userId } });
   * }
   */
  model: { new (): T } & typeof Model,
  foreignKey: keyof T,
  id: string | number
): Promise<void> {
  const dependentRows = await model.count({
    where: { [foreignKey]: id } as WhereOptions<T>
  });
  if (dependentRows > 0) {
    throw new Error('Cannot delete, related records exists.');
  }
}
