import React, { useState } from 'react';
import './GameProgressViewer.css'; // Import CSS file for styling

function GameProgressViewer() {
  const [turnsData, setTurnsData] = useState(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [gameSize, setGameSize] = useState(null);
  const [startBoard, setStartBoard] = useState(null);
  const [boardStates, setBoardStates] = useState([]);
  const [playerScores, setPlayerScores] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = JSON.parse(e.target.result);
      setGameSize(jsonData.game);
      setTurnsData(jsonData.turns);
      setStartBoard(jsonData.start);
      setCurrentTurnIndex(0); // Reset turn index
      setPlayerCount(jsonData.game.players);
      generateBoardStates(jsonData.start, jsonData.turns, jsonData.game.players);
    };
    reader.readAsText(file);
  };

  const generateBoardStates = (startBoard, turns, playerCount) => {
    const states = [startBoard.map(row => [...row])]; // Clone the start board
    let currentBoard = startBoard.map(row => [...row]);

    const initialScores = Array(playerCount).fill(0);
    const scores = [initialScores];
    for (const turn of turns) {
      const prevTurnScores = scores[scores.length - 1].slice();
      applyTurn(turn, currentBoard, prevTurnScores);
      scores.push(prevTurnScores.map((score, idx) => {
        return idx === turn.player - 0x80 ? turn.score : score;
      }));
      states.push(currentBoard.map(row => [...row]));
    }
    setBoardStates(states);
    setPlayerScores(scores);
  };

  const applyTurn = (turn, board, scores) => {
    if (turn.type === "pass") return; // Do nothing for "pass" turn
    if (turn.type === "place" && turn.src_col !== undefined && turn.src_row !== undefined) {
      const { src_row, src_col, player } = turn;
      board[src_row][src_col] = player;
    }
    if (turn.type === "move" && turn.src_col !== undefined && turn.src_row !== undefined &&
        turn.dst_col !== undefined && turn.dst_row !== undefined) {
      const { src_row, src_col, dst_row, dst_col } = turn;
      board[dst_row][dst_col] = board[src_row][src_col];
      board[src_row][src_col] = 0;
    }
  };

  const renderTurn = () => {
    if (!gameSize || !boardStates[currentTurnIndex]) return null;
    const currentBoardState = boardStates[currentTurnIndex];
    const currentTurn = turnsData[currentTurnIndex];
    return (
      <div className="board">
        {currentBoardState.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                className="cell"
                key={colIndex}
                style={{
                  width: '48px',
                  height: '48px',
                  position: 'relative', // Ensure the container is positioned relative to its parent
                }}
              >
                {cell > 0 && cell < 4 && ( // Check if the cell value is within range for fish images
                  <>
                    <img
                      src={require(`./assets/images/${cell}_fish.png`)}
                      alt={`Fish ${cell}`}
                      style={{
                        position: 'absolute', // Position the image absolutely inside the cell
                        top: 0, // Align to the top
                        left: 0, // Align to the right
                        width: '32px', // Set image width to 32px
                        height: '32px', // Set image height to 32px
                      }}
                    />
                    <span className="value-overlay">{cell}</span> {/* Display the value over the fish image */}
                  </>
                )}
                {cell >= 0x80 && (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <i className="fas fa-user player-symbol" style={{ color: cell === 128 ? 'green' : cell === 129 ? 'red' : 'black' }} />
                    <span className="player-id" style={{ color: cell === 128 ? 'green' : cell === 129 ? 'red' : 'black', bottom: 0, right: 0 }}>
                    {String.fromCharCode(cell - 0x80 + 'A'.charCodeAt(0))}
                    </span>
                </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  const renderArrow = () => {
    if (!gameSize || !boardStates[currentTurnIndex] || !turnsData || currentTurnIndex < 1) return null;
  
    const currentTurn = turnsData[currentTurnIndex - 1];
    if (currentTurn.type !== 'move') return null;
  
    const { src_col, src_row, dst_col, dst_row } = currentTurn;
  
    return (
      <div className="arrow-container">
        <svg className="arrow" width="100%" height="100%">
          {/* Define arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill="lightgreen">
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
          {/* Draw arrow line with arrowhead marker */}
          <line x1={src_col * 50 + 25} y1={src_row * 50 + 25} x2={dst_col * 50 + 25} y2={dst_row * 50 + 25} stroke="lightgreen" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </svg>
      </div>
    );
  };
  
  const renderPlayerScores = () => {
    if (!playerScores || playerScores.length === 0) return null;
    const currentScores = playerScores[currentTurnIndex];
    return (
      <div className="player-scores">
        <table>
          <tbody>
            {currentScores.map((score, playerIndex) => (
              <tr key={playerIndex}>
                <td>Player {String.fromCharCode('A'.charCodeAt(0) + playerIndex)}</td>
                <td>{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrevTurn = () => {
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex(currentTurnIndex - 1);
    }
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < turnsData.length) {
      setCurrentTurnIndex(currentTurnIndex + 1);
    }
  };

  const handleFirstTurn = () => {
    setCurrentTurnIndex(0);
  };

  const handleLastTurn = () => {
    setCurrentTurnIndex(turnsData.length - 1);
  };

  return (
    <div className="container">
      <input type="file" onChange={handleFileChange} />
      <div className="game-info">
        <table className="game-info-table">
          <tbody>
            <tr>
              <td>Game Width:</td>
              <td>{gameSize ? gameSize.width : ''}</td>
            </tr>
            <tr>
              <td>Game Height:</td>
              <td>{gameSize ? gameSize.height : ''}</td>
            </tr>
            <tr>
              <td>Players Count:</td>
              <td>{gameSize ? gameSize.players : ''}</td>
            </tr>
            <tr>
              <td>Max Fish Count:</td>
              <td>{gameSize ? gameSize.fishes : ''}</td>
            </tr>
            <tr>
              <td>Penguins Count:</td>
              <td>{gameSize ? gameSize.penguins : ''}</td>
            </tr>
          </tbody>
        </table>
        {renderPlayerScores()}
      </div>
      <div className="board-container">
        <div className="board">{renderTurn()}</div>
        {renderArrow()} {/* Call the function to render the arrow */}
      </div>
      <div className="turn-info">
        Current Turn: {currentTurnIndex}
      </div>
      <div className="controls">
                <button onClick={handleFirstTurn} disabled={currentTurnIndex === 0}>
            <i className="fas fa-step-backward"></i> {/* Icon for first turn */}
            </button>
            <button onClick={handlePrevTurn} disabled={currentTurnIndex === 0}>
            <i className="fas fa-backward"></i> {/* Icon for previous turn */}
            </button>
            <button onClick={handleNextTurn} disabled={!turnsData || currentTurnIndex === turnsData.length - 1}>
            <i className="fas fa-forward"></i> {/* Icon for next turn */}
            </button>
            <button onClick={handleLastTurn} disabled={!turnsData || currentTurnIndex === turnsData.length - 1}>
            <i className="fas fa-step-forward"></i> {/* Icon for last turn */}
            </button>
      </div>
    </div>
  );
}

export default GameProgressViewer;
