import React from "react";
import { useNavigate } from "react-router-dom";

const LevelCard = ({ level }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/levels/${level.id}/lessons`)}
      className="bg-[#FFF9EF] rounded-2xl shadow-md p-6 hover:shadow-lg cursor-pointer transition duration-300"
    >
      <h2 className="text-2xl font-bold text-[#665446] mb-2">{level.name}</h2>
      <p className="text-[#665446]">{level.description}</p>
    </div>
  );
};

export default LevelCard;
