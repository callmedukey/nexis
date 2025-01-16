export class ServerResponse {
  static success<T>(data: T) {
    return Response.json({ success: true, data });
  }

  static error(message: string) {
    return Response.json({ success: false, error: message });
  }
}
