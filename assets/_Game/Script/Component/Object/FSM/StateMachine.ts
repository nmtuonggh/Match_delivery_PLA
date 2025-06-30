import { Item } from '../Item';
import { IState } from './IState';

/**
 * Lớp quản lý các state của Item và chuyển đổi giữa các state
 */
export class StateMachine
{
    private owner: Item;
    private currentState: IState | null = null;
    private states: Map<string, IState> = new Map<string, IState>();
    private isTransitioning: boolean = false;

    constructor ( owner: Item )
    {
        this.owner = owner;
    }

    public addState ( stateName: string, state: IState ): void
    {
        this.states.set( stateName, state );
    }

    public changeState ( stateName: string ): boolean
    {
        if ( this.isTransitioning )
        {
            console.warn( 'Đang trong quá trình chuyển state, không thể chuyển tiếp!' );
            return false;
        }

        // Kiểm tra state tồn tại
        const nextState = this.states.get( stateName );
        if ( !nextState )
        {
            console.error( `State ${ stateName } không tồn tại!` );
            return false;
        }

        // Nếu state hiện tại và state mới giống nhau, không làm gì
        if ( this.currentState === nextState )
        {
            return true;
        }

        this.isTransitioning = true;

        // Thoát khỏi state hiện tại nếu có
        if ( this.currentState )
        {
            this.currentState.exit( this.owner );
        }

        // Ghi lại state mới và gọi hàm enter
        this.currentState = nextState;
        this.currentState.enter( this.owner );

        this.isTransitioning = false;
        return true;
    }

    /**
     * Cập nhật state hiện tại nếu có
     * @param deltaTime Thời gian trôi qua từ frame trước
     */
    public update ( deltaTime: number ): void
    {
        if ( this.currentState && !this.isTransitioning )
        {
            this.currentState.update( this.owner, deltaTime );
        }
    }

    /**
     * Lấy state hiện tại
     * @returns State hiện tại
     */
    public getCurrentState (): IState | null
    {
        return this.currentState;
    }

    /**
     * Lấy tên của state hiện tại
     * @returns Tên của state hiện tại hoặc 'None' nếu không có
     */
    public getCurrentStateName (): string
    {
        return this.currentState ? this.currentState.getName() : 'None';
    }
}
