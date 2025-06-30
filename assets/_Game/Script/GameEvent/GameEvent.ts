export class GameEvent{
    // Triển khai các sự kiện game ở đây
    // Ví dụ:
    // static EVENT_GAME_START = "GameStart";
    public static readonly NewItemOnShelf: string = "NewItemOnShelf";
    public static readonly ItemMatched: string = "ItemMatched";
    public static readonly GameWin: string = "GameWin";
    public static readonly GameLose: string = "GameLose";
}