import {StoreAction} from './store-action';

/**
 * Action containing an error
 */
export abstract class ErrorAction extends StoreAction {

  /**
   * Flag indicating that the action contains an error payload.
   */
  readonly error: true = true;

  /**
   * Error data.
   */
  payload: Error;

  /**
   * Map of error messages that can be utilized to display
   * to the user the proper error meessage depending on the code
   * of the error contained in the payload.
   */
  readonly errorMsgs?: {[code: string]: string} = {};

  /**
   * Define a function that should return if a message related to this error should be displayed to the user
   * or it should be hidden (not shown/prompted).
   *
   * If the field is not set (i.e. undefined), the defsult behavior will be adopted.
   * The default behavior should be defined by the component of the application that handles the
   * "error stream" listening and actually presents the error message to the user.
   */
  readonly displayErrorFn?: () => boolean;

}
