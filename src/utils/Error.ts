export class ExhaustiveError extends Error {
  constructor(value: never, message = `Unsupported type: ${String(value)}`) {
    super(message)
  }
}
