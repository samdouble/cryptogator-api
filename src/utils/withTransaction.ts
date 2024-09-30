export async function withTransaction(session, closure) {
  let result;
  await session.withTransaction(() => {
    result = closure();
    return result;
  });
  return result;
}
