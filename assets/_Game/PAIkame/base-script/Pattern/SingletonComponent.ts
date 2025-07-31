import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;
export abstract class SingletonComponent extends Component {
    private static _instances: Map<any, any> = new Map();
    public static Instance<T>(this: new () => T): T {
        if (!SingletonComponent._instances.has(this)) {
            const node: Node = new Node(this.name.toString());
            director.addPersistRootNode(node);
            const instance = node.addComponent(<any>this);

            SingletonComponent._instances.set(this, instance);
            (instance as any).init();
        }

        return SingletonComponent._instances.get(this);
    }
    protected init() {}
}