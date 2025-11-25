const PrismaClientMock: { new (): { $extends(): void } } = class {
  $extends(): void {}
}

// NOTE: readReplicas のダミーモジュール
const readReplicasMock = (): { url: string[] } => ({
  url: ['mocked_url'],
})

export { PrismaClientMock as PrismaClient, readReplicasMock as readReplicas }
