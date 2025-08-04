import { _decorator, Component, Node, Vec3 } from 'cc';
import { Item } from '../Component/Object/Item';
import { ShelfContainer } from '../Component/Shelf/ShelfContainer';
import { VariableConfig } from '../Config/VariableConfig';
import { ParticleSpawnManager } from './ParticleSpawnManager';
const { ccclass, property } = _decorator;

@ccclass( 'CollectHandler' )
export class CollectHandler extends Component
{
    public static instance: CollectHandler = null;

    public onLoad (): void
    {
        CollectHandler.instance = this;
    }
    public UpdatePickUpItemDead ( item: Item ): void
    {
        let shelfContainer = ShelfContainer.instance;
        // console.log("Sort item on UpdatePickUpItemDead");

        shelfContainer.sortItemOnShelf();

        if ( !item.isDead ) return;

        for ( let i = 0; i < shelfContainer.doneMoveCountCheck; i++ )
        {
            let obj = shelfContainer.listPickedItem[ i ];
            if ( obj.canNotCollect() ) continue;
            if ( i >= shelfContainer.doneMoveCountCheck - 2 ) continue;
            if ( shelfContainer.listPickedItem[ i + 1 ].canNotCollect() ||
                shelfContainer.listPickedItem[ i + 2 ].canNotCollect() ) continue;

            item.isCollected = true;
            shelfContainer.listPickedItem[ i + 1 ].isCollected = true;
            shelfContainer.listPickedItem[ i + 2 ].isCollected = true;
            this.Collect( i + 1 );
            
        }
    }

    public Collect ( centerIndex: number ): void
    {
        this.IECollect( centerIndex, this.collectEffect.bind( this ) );
    }

    public async IECollect ( centerIndex: number, callback: ( item: Item ) => void ): Promise<void>
    {
        let shelfContainer = ShelfContainer.instance;

        let centerPos = shelfContainer.getSlotPos( centerIndex );
        let matchItem0 = shelfContainer.listPickedItem[ centerIndex - 1 ];
        let matchItem1 = shelfContainer.listPickedItem[ centerIndex ];
        let matchItem2 = shelfContainer.listPickedItem[ centerIndex + 1 ];

        await this.delay( VariableConfig.DELAY_COLLECT_TIME );

        matchItem0.Collect( centerPos );
        matchItem1.Collect( centerPos );
        matchItem2.Collect( centerPos );

        await this.delay( VariableConfig.COLLECT_TIME );
        //TODO : Sound Collect

        // matchItem0.node.active = false;
        // matchItem2.node.active = false;
        matchItem1.midCollected();

        //loai 3 item nay ra khoi , llloai theo object  
        shelfContainer.listPickedItem.splice( centerIndex - 1, 3 );
        shelfContainer.currentPickedTotalCount -= 3;
        shelfContainer.doneMoveCountCheck -= 3;

        shelfContainer.sortItemOnShelf();
        callback( matchItem1 );
        //TODO: Setwarning here

    }

    public collectEffect ( item: Item )
    {
        let startPos = item.node.getWorldPosition().clone();
        this.scheduleOnce( () =>
        {
            ParticleSpawnManager.instance.spawn3DParticle( 0, new Vec3( startPos.x, startPos.y + 4, startPos.z ) );
        }, 0.1 );

    }

    public delay ( time: number ): Promise<void>
    {
        return new Promise( resolve => setTimeout( resolve, time ) );
    }
}


