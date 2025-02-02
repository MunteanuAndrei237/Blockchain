import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Container, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

const Activity = ({ contract }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const getActivities = async () => {
      try {
        const filter = contract.filters.GetRewards(); // Create filter for GetRewards event
        const events = await contract.queryFilter(filter, 0, 'latest'); // Get events from block 0 to the latest

        const activityData = events.map(event => ({
          receiver: event.args.receiver,
          amount: ethers.formatUnits(event.args.amount, 5), // Format LEET with 5 decimals
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
    <Container maxWidth="md" style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Activity Feed
      </Typography>
      <Typography variant="subtitle1" paragraph>
        Here you can see the list of rewards claimed for solving problems.
      </Typography>
      
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Receiver Address</strong></TableCell>
              <TableCell><strong>Amount (LEET)</strong></TableCell>
              <TableCell><strong>Problem ID</strong></TableCell>
              <TableCell><strong>Solving Time (ms)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell>{activity.receiver}</TableCell>
                <TableCell>{activity.amount}</TableCell>
                <TableCell>{activity.problemId}</TableCell>
                <TableCell>{activity.solvingTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default Activity;
