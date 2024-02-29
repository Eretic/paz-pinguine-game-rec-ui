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
    return (
      <div className="board">
        {currentBoardState.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                className="cell"
                key={colIndex}
                style={{
                  backgroundColor: cell === 0 ? 'grey' : cell === 128 ? 'green' : cell === 129 ? 'red' : 'white',
                  width: '48px',
                  height: '48px',
                  position: 'relative', // Ensure the container is positioned relative to its parent
                }}
              >
                {cell > 0 && cell < 4 && ( // Check if the cell value is within range for fish images
                  <>
                    <img src={require(`./assets/images/${cell}_fish.png`)} alt={`Fish ${cell}`} style={{ width: '100%', height: '100%' }} />
                    <span className="value-overlay">{cell}</span> {/* Display the value over the fish image */}
                  </>
                )}
                {cell >= 0x80 && String.fromCharCode(cell - 0x80 + 'A'.charCodeAt(0))} {/* Display characters for cell values greater than or equal to 0x80 */}
              </div>
            ))}
          </div>
        ))}
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
