/**
 * ゲーム関連の基底エラー
 */
export class GameError extends Error {}

/**
 * ゲーム定義が正しくされていない事に起因するエラー
 */
export class GameDefinitionError extends GameError {}

/**
 * 禁止された操作を行おうとした時のエラー
 */
export class GameForbiddenOperationError extends GameError {}

/**
 * ゲーム進行時に矛盾が起きた時のエラー
 */
export class GameRuntimeError extends GameError {}
