import { Item } from '../Item';
import { IState } from './IState';

/**
 * State khi Item đang ở trạng thái nghỉ, chưa được tương tác
 */
export class IdleState implements IState
{
    private readonly name: string = 'Idle';

    constructor () { }

    public enter ( item: Item ): void
    {
       // console.log( `${ item.node.name } đã vào trạng thái Idle` );
    }

    public exit ( item: Item ): void
    {
       // console.log( `${ item.node.name } đã rời khỏi trạng thái Idle` );
    }

    public update ( item: Item, deltaTime: number ): void
    {
    }

    public getName (): string
    {
        return this.name;
    }
}
