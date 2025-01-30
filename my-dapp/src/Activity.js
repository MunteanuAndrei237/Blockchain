import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Activity = ({ contract }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const getActivities = async () => {
      try {
        // Folosim `queryFilter` pentru a obține evenimente istorice
        const filter = contract.filters.GetRewards(); // Crează un filtru pentru evenimentul GetRewards
        const events = await contract.queryFilter(filter, 0, 'latest'); // Obținem evenimentele din blocul 0 până la ultimul

        const activityData = events.map(event => ({
          receiver: event.args.receiver,
          amount: ethers.formatUnits(event.args.amount, 5), // Formatează LEET cu 5 zecimale
          problemId: event.args.problemId.toString(),
          solvingTime: event.args.solvingTime.toString()
        }));
        
        setActivities(activityData);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    getActivities();
  }, [contract]);

  return (
    <div>
      <h2>Activity Feed</h2>
      <table>
        <thead>
          <tr>
            <th>Receiver Address</th>
            <th>Amount (LEET)</th>
            <th>Problem ID</th>
            <th>Solving Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index}>
              <td>{activity.receiver}</td>
              <td>{activity.amount}</td>
              <td>{activity.problemId}</td>
              <td>{activity.solvingTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Activity;
