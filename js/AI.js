import PawnBase from "../js/PawnBase.js"

let maxDepth = 1;

export default class AI 
{
    constructor(scene, name , TypeOfAi)
    {
        this.scene = scene;

        this.name = name;
		
		this.TypeOfAi = TypeOfAi;

        this.bAIMadeMove = false;

        this.score = 0;
		this.shapeCount = 0;
		this.shapeOnAvr = 0;
		this.secondBigShape = 0;
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------
    //START OF RANDOM AI

    aiMakeFirstRandomMove(AI)
    {   
        let randomX = Phaser.Math.Between(0, 6);
        let randomY = Phaser.Math.Between(0, 6);
		let Player1;
		let Player2;

        if((this.scene.boardArray[randomX][randomY].bIsTaken == false) && (this.scene.CheckIfAnyFreeTilesAround(randomX, randomY)))
         {
            this.tile = this.scene.boardArray[randomX][randomY];
            this.scene.boardArray[randomX][randomY].bIsTaken = true;
            
            if(this.scene.getNumberOfAI() == 1)
            {
				Player1 =  this.scene.player1;
				Player2 = this.scene.AI1;
            }
            else if(this.scene.getNumberOfAI() == 2)
            {
                if(this.scene.AIType.Random)
                {
					Player1 =  this.scene.AI1;
					Player2 = this.scene.AI2;
                }
                else if(this.scene.AIType.Minimax)
                {
					Player1 =  this.scene.AI2;
					Player2 = this.scene.AI1;
                } 
            }  
			
			this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'WhitePiece', Player1);
            this.aiMakeSecondRandomMove(Player2, randomX, randomY);   
         }
        else if(this.scene.CheckHowManyMovesPossible() > 0)
        {
            this.aiMakeFirstRandomMove(AI);
        }
    }

    aiMakeSecondRandomMove(Owner, x, y)
    {
        let bIsPlaced = false;
		let cordIf;
		let xCord;
		let yCord;
		
        do
        {
            let randomNum = Phaser.Math.Between(0, 3);
            switch (randomNum) 
			{
                case 0:
                        cordIf = (y+1 <= 6);
						xCord = (x);
						yCord = (y+1);

                    break;
                case 1:
                      	cordIf = (y-1 >= 0);
						xCord = (x);
						yCord = (y-1);
                    break;
                case 2:
						cordIf = (x+1 <= 6);
						xCord = (x+1);
						yCord = y;
                    break;
                case 3:
						cordIf = (x-1 >= 0);
						xCord = (x-1);
						yCord = y;
                    break;    
                default:
                    console.log("Fail reading random number")
                    break;
			}
				
				if(cordIf && (this.scene.boardArray[xCord][yCord].bIsTaken == false))
				{
				this.tile = this.scene.boardArray[xCord][yCord];
                this.scene.boardArray[xCord][yCord].bIsTaken = true;       
                this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, 'BlackPiece', Owner);
                bIsPlaced = true;	
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
                    optimalSecondMoveScore = this.aiMakeSecondOptimalMove(j, i, this.scene.AI2, true, 0,true,true);
					}
					else
					{
					optimalSecondMoveScore = this.aiMakeSecondOptimalMove(j, i, this.scene.player1, true, 0,true,true);
					}
				
                    //Czyscimy postawiony pionek
                    this.tile = this.scene.boardArray[j][i];
                    this.tile.PawnBase = null;
                    this.scene.boardArray[j][i].bIsTaken = false;
                    
                    if (optimalSecondMoveScore == null)  
                    {
                        console.log("optimalSecondmovepusty");
                    }
                    
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
			
			//console.log("--------------------------------------------");
			//console.log("Sprawdzam Kordy X:" + optimalMove.i + " Y:" + optimalMove.j);
			this.scene.CheckWhoHasMoreScore();
            
        }
        
        this.scene.saveCurrentScore();
    }

    aiMakeSecondOptimalMove(j, i, owner, bCallMiniMax,depth, bIsisMaximazing, bFirstCall)
    {
        let optimalMove;
        let XCord;
        let YCord;
        let FirstCheck;
		let score;
		let bCheckOptimalScore;
		let optimalScore;

        if (bIsisMaximazing)
        {
            optimalScore = -Infinity;
        }
        else 
        {
            optimalScore = Infinity;
        }

		


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
             this.tile = this.scene.boardArray[YCord][XCord];
             this.scene.boardArray[YCord][XCord].bIsTaken = true;
             this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', owner);
            
             //console.log("-------------------------------------------------");
             //console.log("x: " + YCord + " y: " + (XCord));
            
                //Call minimax
              if(bCallMiniMax == true)
             {
				 
				if (this.scene.getNumberOfAI() == 2 && bIsisMaximazing == false)
				{
					score = this.minimax(depth, true, this.scene.AI1);	
				}
				else if(this.scene.getNumberOfAI() == 2 && bIsisMaximazing == true)
				{
					score = this.minimax(depth, false, this.scene.AI2);
				}
				else if(this.scene.getNumberOfAI() == 1 && bIsisMaximazing == true)
				{
					score = this.minimax(depth, false, this.scene.player1);
				}
				else if(this.scene.getNumberOfAI() == 1 && bIsisMaximazing == false)
				{
					score = this.minimax(depth, true, this.scene.AI1);	
				}	
             }
             else
             {
				 //console.log("Sprawdzam Kordy X:" + i + " Y:" + j);
                 score = this.scene.CheckWhoHasMoreScore();
             }


            //Checks for score
            if (bIsisMaximazing)
            {
                bCheckOptimalScore = (score >  optimalScore);
            }
            else 
            {
                bCheckOptimalScore = (score <  optimalScore);
            }


             //Undo the move
             this.tile = this.scene.boardArray[YCord][XCord];
             this.tile.PawnBase = null;
             this.scene.boardArray[YCord][XCord].bIsTaken = false;
             
             //Bind the score
             if(bCheckOptimalScore)
             {
                //console.log("CheckOptimaScore:" + score + " bIsisMaximazing:" + bIsisMaximazing + " optimalScore: " + optimalScore);
                 optimalScore = score;
                 let tempI = XCord;
                 let tempJ = YCord;
                 optimalMove = {tempJ, tempI, optimalScore};
             }
            }
        } 
        if (bFirstCall)
        {
            console.log("Zvvracam")
            return optimalMove;    
        }
        else
        {
            if (optimalScore == Infinity || optimalScore == -Infinity)
            {
            // console.log("Zwrocilo infnity second move, score:" +score + " bMaximazing:" + bIsisMaximazing ); 
            }
            return  optimalScore;
        }   
    }
    
    
    minimax(depth, isMaximazing, owner)
    {
    let optimalScore;
    let ownerOfSecondPawn
    let score=0;

        if(isMaximazing)
        {
            optimalScore = -Infinity;
            ownerOfSecondPawn = this.scene.AI1;
        }
        else 
        {
              optimalScore = Infinity;
           
            if (this.scene.getNumberOfAI() == 2)
			{
				ownerOfSecondPawn = this.scene.AI2;
			}
			else
			{
				ownerOfSecondPawn = this.scene.player1;
			}
        }

         for(let i = 0; i < 7; i++)
        {
            for(let j = 0; j < 7; j++)
            {
                if(this.scene.boardArray[j][i].bIsTaken == false && this.scene.CheckIfAnyFreeTilesAround(j, i))
                {
                    //Stawiamy pierwszego pionka

                    //let score; usun komentarz
                    this.tile = this.scene.boardArray[j][i];
                    this.scene.boardArray[j][i].bIsTaken = true;
                    this.tile.PawnBase = new PawnBase(this.scene, this.tile.XOffset, this.tile.YOffset, '1', owner);

                    //Wchodzimy do funkcji ktora stawia drugiego i wywoluje rekurencyjnie minimaxa
                        
                        if(depth < maxDepth)
                        {
							depth++;
                            score = this.aiMakeSecondOptimalMove(j, i, ownerOfSecondPawn, true,depth,isMaximazing,false);
                        }
                        else 
                        {
							//console.log("Sprawdzam Kordy X:" + i + " Y:" + j);
                            score = this.scene.CheckWhoHasMoreScore();
                        }

                       //console.log("Minmax Score: "+ score);  
                        if(isMaximazing)
                        {
                            if(score > optimalScore)
                            {
                                optimalScore = score;
                            }
                                     
                        } 
                        else 
                        {
                            if(score < optimalScore)
                            {
                                optimalScore = score;
                            } 
                        }
                        this.tile = this.scene.boardArray[j][i];
                        this.tile.PawnBase = null;
                        this.scene.boardArray[j][i].bIsTaken = false;
                    }   
                }
            } 

            if (optimalScore == Infinity || optimalScore == -Infinity)
            {
             //console.log("Zwrocilo infnity minmax, score:" +score + " bMaximazing:" + isMaximazing); 
            }
            return optimalScore;    
        }
    //END OF MINIMAX AI
    //----------------------------------------------------------------------------------------------------------------------------------------------

}