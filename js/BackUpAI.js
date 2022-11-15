import PawnBase from "../js/PawnBase.js"

let maxDepth = 2;

export default class AI 
{
    constructor(scene, name , aiType)
    {
        this.scene = scene;

        this.name = name;
		
		this.aiType = aiType;

        this.bAIMadeMove = false;

        this.score = 0;
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------
    //START OF RANDOM AI

    aiMakeFirstRandomMove(AI)
    {   
        let randomX = Phaser.Math.Between(0, 6);
        let randomY = Phaser.Math.Between(0, 6);

        if((this.scene.boardArray[randomX][randomY].bIsTaken == false) &&
        (this.scene.CheckIfAnyFreeTilesAround(randomX, randomY)))
         {
            this.tile = this.scene.boardArray[randomX][randomY];
            this.scene.boardArray[randomX][randomY].bIsTaken = true;
            
            if(this.scene.getNumberOfAI() == 1)
            {
                this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', this.scene.player1);
                this.aiMakeSecondRandomMove(this.scene.AI1, randomX, randomY);  
            }
            else if(this.scene.getNumberOfAI() == 2)
            {
                if(this.scene.AIType.Random)
                {
                    this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', this.scene.AI1);
                    this.aiMakeSecondRandomMove(this.scene.AI2, randomX, randomY);  
                }
                else if(this.scene.AIType.minimax)
                {
                    this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', this.scene.AI2);
                    this.aiMakeSecondRandomMove(this.scene.AI1, randomX, randomY);   
                } 
            }  
         }
        else if(this.scene.CheckHowManyMovesPossible() > 0)
        {
            this.aiMakeFirstRandomMove(AI);
        }
    }

    aiMakeSecondRandomMove(Owner, x, y)
    {
        let bIsPlaced = false;
        do
        {
            let randomNum = Phaser.Math.Between(0, 3);
            switch (randomNum) {
                case 0:
                    if((y+1 <= 6) && (this.scene.boardArray[x][y+1].bIsTaken == false))
                    {
                        this.tile = this.scene.boardArray[x][y+1];
                        this.scene.boardArray[x][y+1].bIsTaken = true;
                        
                        this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', Owner);
                        
                        bIsPlaced = true;
                    }
                    break;
                case 1:
                    if((y-1 >= 0) && (this.scene.boardArray[x][y-1].bIsTaken == false))
                    {
                        this.tile = this.scene.boardArray[x][y-1];
                        this.scene.boardArray[x][y-1].bIsTaken = true;
                        
                        this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', Owner);
                        
                        bIsPlaced = true;
                    }
                    break;
                case 2:
                    if((x+1 <= 6) && (this.scene.boardArray[x+1][y].bIsTaken == false))
                    {
                        this.tile = this.scene.boardArray[x+1][y];
                        this.scene.boardArray[x+1][y].bIsTaken = true;
                        
                        this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', Owner);
                        
                        bIsPlaced = true;
                    }
                    break;
                case 3:
                    if((x-1 >= 0) && (this.scene.boardArray[x-1][y].bIsTaken == false))
                    {
                        this.tile = this.scene.boardArray[x-1][y];
                        this.scene.boardArray[x-1][y].bIsTaken = true;
                        
                        this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', Owner);
                        
                        bIsPlaced = true;
                    }
                    break;    
                default:
                    console.log("Fail reading random number")
                    break;
            }
        } while(bIsPlaced != true)
        
    }

    //END OF RANDOM AI
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //START OF MINIMAX AI

    aiMakeFirstOptimalMove() 
    {
		
        this.scene.saveCurrentScore();
        let optimalScore = -Infinity;
        let optimalSecondMoveScore;
        let optimalMove;
        let optimalSecondMove;
		
        for(let i = 0; i < 7; i++)
        {
            for(let j = 0; j < 7; j++)
            {
                if(this.scene.boardArray[j][i].bIsTaken == false && this.scene.CheckIfAnyFreeTilesAround(j, i))
                {
                    //Stawiamy pierwszy pionek
                    this.tile = this.scene.boardArray[j][i];
                    this.scene.boardArray[j][i].bIsTaken = true;
                    this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', this.scene.AI1);
                    
                    //Wchodzimy do funkcji ktora stawia drugi pionek i sprawdza score z takim ulozeniem
					if (this.scene.getNumberOfAI() == 2)
					{
                    optimalSecondMoveScore = this.aiMakeSecondOptimalMove(j, i, this.scene.AI2, true, 0);
					}
					else
					{
					optimalSecondMoveScore = this.aiMakeSecondOptimalMove(j, i, this.scene.player1, true, 0);
					}
				
                    
                    //Czyscimy postawiony pionek
                    this.tile = this.scene.boardArray[j][i];
                    this.tile.PawnBase = null;
                    this.scene.boardArray[j][i].bIsTaken = false;
                        
                    //Porownujemy scory, jesli jest wiekrzy niz dotychczasowy score optymalny, nadpisujemy score optymalny i przypisujemy cordy
                    if(optimalSecondMoveScore.optimalScore > optimalScore)
                    {
                        optimalScore = optimalSecondMoveScore.optimalScore;
                        optimalMove = {j, i};
                        
                        let SecondJ = optimalSecondMoveScore.tempJ;
                        let SecondI = optimalSecondMoveScore.tempI;
                        optimalSecondMove = {SecondJ, SecondI};
                    }     
                }   
            }
        }
        //Stawiamy pionki na optymalnych miejscach
        if(this.scene.CheckHowManyMovesPossible() > 0)
        {
			//this.scene.clearBoardEmptyPawns();
            this.tile = this.scene.boardArray[optimalMove.j][optimalMove.i];
            this.scene.boardArray[optimalMove.j][optimalMove.i].bIsTaken = true;
            this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', this.scene.AI1);
    
            this.tile = this.scene.boardArray[optimalSecondMove.SecondJ][optimalSecondMove.SecondI];
            this.scene.boardArray[optimalSecondMove.SecondJ][optimalSecondMove.SecondI].bIsTaken = true;
			if (this.scene.getNumberOfAI() == 2)
			{
			 this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', this.scene.AI2);	
			}
			else
			{
			this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', this.scene.player1);	
			}
            
        }
        
        this.scene.saveCurrentScore();
    }

    aiMakeSecondOptimalMove(j, i, owner, bCallMiniMax,depth)
    {
        let optimalScore = -Infinity;
        let optimalMove;
        let XCord;
        let YCord;
        let FirstCheck;

        for(let z = 0; z < 4; z++) 
        {
            switch (z)
            {
            case 0:
                XCord = i+1
                YCord = j
                FirstCheck = (i+1 <= 6);
              break;
            case 1:
                XCord = i
                YCord = j+1
                FirstCheck = (j+1 <= 6);
              break;
            case 2:
                XCord = i
                YCord = j-1
                FirstCheck = (j-1 >= 0);
              break;
            case 3:
                XCord = i-1
                YCord = j
                FirstCheck = (i-1 >= 0);
              break;  
            }
            
            if((FirstCheck == true) && (this.scene.boardArray[YCord][XCord].bIsTaken == false))
            {
             //Do the move
             let score
             this.tile = this.scene.boardArray[YCord][XCord];
             this.scene.boardArray[YCord][XCord].bIsTaken = true;
             this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', owner);
            
             //console.log("-------------------------------------------------");
             //console.log("x: " + YCord + " y: " + (XCord));
            
                //Call minimax
              if(bCallMiniMax)
             {
				if (this.scene.getNumberOfAI() == 2)
				{
				score = this.minimax(this.scene.boardArray, depth, false, this.scene.AI2);	
				}
				else
				{
				score = this.minimax(this.scene.boardArray, depth, false, this.scene.player1);
				}
             }
             else
             {
                 score = this.scene.CheckWhoHasMoreScore();
             }

             //Undo the move
             this.tile = this.scene.boardArray[YCord][XCord];
             this.tile.PawnBase = null;
             this.scene.boardArray[YCord][XCord].bIsTaken = false;
             
             //Bind the score
             if(score > optimalScore)
             {
                 optimalScore = score;
                 let tempI = XCord;
                 let tempJ = YCord;
                 optimalMove = {tempJ, tempI, optimalScore};
             }
            }
        } 
        return optimalMove;       
    }
    
    
    minimax(board, depth, isMaximazing, owner)
    {
	//console.log("Glebokosc: " + (depth));
	//console.log("ChybaMaxGlebokosc: " + maxDepth);
        if(isMaximazing)
        {
            let optimalScore = -Infinity;
            for(let i = 0; i < 7; i++)
            {
                for(let j = 0; j < 7; j++)
                {
                    if(this.scene.boardArray[j][i].bIsTaken == false && this.scene.CheckIfAnyFreeTilesAround(j, i))
                    {
                        //if(this.scene.getNumberOfAI() == 1)
                        //{
                        //Stawiamy pierwszego pionka
                        let score;
                        this.tile = this.scene.boardArray[j][i];
                        this.scene.boardArray[j][i].bIsTaken = true;
                        this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', owner);

                        //Wchodzimy do funkcji ktora stawia drugiego i wywoluje rekurencyjnie minimaxa
                        
                        if(depth < maxDepth)
                        {
							depth++;
                            score = this.aiMakeSecondOptimalMove(j, i, this.scene.AI1, true,depth);
                           
                        }
                        else 
                        {
                            score = this.scene.CheckWhoHasMoreScore();
                        }
                        if(score > optimalScore)
                        {
                            optimalScore = score;              
                        } 
                        else if(score == optimalScore)
                        {
                            optimalMove = {j, i};
                        }

                        this.tile = this.scene.boardArray[j][i];
                        this.tile.PawnBase = null;
                        this.scene.boardArray[j][i].bIsTaken = false;

                        //}   
                    }   
                }
            } 
            return optimalScore;    
        }
        else
        {
            let optimalScore = Infinity;
            let optimalMove;

			
            for(let i = 0; i < 7; i++)
            {
                for(let j = 0; j < 7; j++)
                {
                    if(this.scene.boardArray[j][i].bIsTaken == false && this.scene.CheckIfAnyFreeTilesAround(j,i))
                    {
                        //if(this.scene.getNumberOfAI() == 1)
                       //{
                            let score;
                            this.tile = this.scene.boardArray[j][i];
                            this.scene.boardArray[j][i].bIsTaken = true;
                            this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', owner);
                            
                            if(depth < maxDepth)
                            {
								depth++;
								if (this.scene.getNumberOfAI() == 2)
								{
									score = this.aiMakeSecondOptimalMove(j, i, this.scene.AI2, true,depth);
								}
								else
								{
									score = this.aiMakeSecondOptimalMove(j, i, this.scene.player1, true,depth);
								}
                                
                            }
                            else 
                            {
                             score = this.scene.CheckWhoHasMoreScore();  
                            }
                            if(score < optimalScore)
                            {
                                optimalScore = score;  
                            } 
                            else if(score == optimalScore)
                            {
                                optimalMove = {j, i};
                            }

                            this.tile = this.scene.boardArray[j][i];
                            this.tile.PawnBase = null;
                            this.scene.boardArray[j][i].bIsTaken = false;
    
                        //}
                    }   
                }
            } 
            return optimalScore;
        }
    }
    //END OF MINIMAX AI
    //----------------------------------------------------------------------------------------------------------------------------------------------

}