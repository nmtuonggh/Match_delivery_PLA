export abstract class Singleton {
    private static _instances: Map<any, any> = new Map();
    public static Instance<T>(this: new () => T): T {
        if (!Singleton._instances.has(this)) {
            const instance: T = new this();
            Singleton._instances.set(this, instance);
            (instance as any).init();
        }

        return Singleton._instances.get(this);
    }
    protected init() {}
}