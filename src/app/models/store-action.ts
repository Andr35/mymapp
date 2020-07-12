
/**
 * And action of the store.
 */
export abstract class StoreAction {

  /**
   * Type of action.
   */
  static type: string;

  /**
   * Optional payload.
   */
  payload?: unknown;
}
