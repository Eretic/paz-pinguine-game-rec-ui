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
                  backgroundColor: cell === 0 ? 'grey' : cell === 128 ? 'green' : cell === 129 ? 'red' : 'white'
                }}
              >
                {cell >= 0x80 ? String.fromCharCode(cell - 0x80 + 'A'.charCodeAt(0)) : cell}
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
        <h2>Player Scores:</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
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
            <tr>
              <td>Current Turn:</td>
              <td>{currentTurnIndex}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="player-info">
        {renderPlayerScores()}
      </div>
      <div className="board-container">
        <div className="board">{renderTurn()}</div>
      </div>
      <div className="controls">
        <button onClick={handleFirstTurn} disabled={currentTurnIndex === 0}>
          First Turn
        </button>
        <button onClick={handlePrevTurn} disabled={currentTurnIndex === 0}>
          Previous Turn
        </button>
        <button onClick={handleNextTurn} disabled={!turnsData || currentTurnIndex === turnsData.length - 1}>
          Next Turn
        </button>
        <button onClick={handleLastTurn} disabled={!turnsData || currentTurnIndex === turnsData.length - 1}>
          Last Turn
        </button>
      </div>
      <div className="turn-info">
        <h2>Turn Information:</h2>
        {turnsData && currentTurnIndex < turnsData.length && (
          <div>
            Turn {currentTurnIndex + 1}: {JSON.stringify(turnsData[currentTurnIndex])}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameProgressViewer;
