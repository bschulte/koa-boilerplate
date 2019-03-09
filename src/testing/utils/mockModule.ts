// Grabbed from: https://spin.atomicobject.com/2018/06/13/mock-typescript-modules-sinon/
// This function allows us to mock a full module while only overriding
// functionality of methods that we want
export function mockModule<T extends { [K: string]: any }>(
  moduleToMock: T,
  defaultMockValuesForMock: Partial<{ [K in keyof T]: T[K] }>
) {
  return (
    sandbox: sinon.SinonSandbox,
    returnOverrides?: Partial<{ [K in keyof T]: T[K] }>
  ): void => {
    const functions = Object.keys(moduleToMock);
    const returns = returnOverrides || {};
    functions.forEach((f: any) => {
      sandbox
        .stub(moduleToMock, f)
        .callsFake(returns[f] || defaultMockValuesForMock[f]);
    });
  };
}
