import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AvailableStacksFilter = ({ children, category }) => {
  const { isAuthenticated, getCompletedStacks } = useAuth();
  const [completedStacks, setCompletedStacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompletedStacks = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const completed = await getCompletedStacks();
          setCompletedStacks(completed);
        } catch (error) {
          console.error('Failed to fetch completed stacks:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompletedStacks();
  }, [isAuthenticated, getCompletedStacks]);

  // Filter out completed stacks if user is authenticated
  const getAvailableStacks = (stacks) => {
    if (!isAuthenticated) return stacks;
    
    return stacks.filter(stack => {
      const stackName = stack.title || stack.name;
      return !completedStacks.includes(stackName);
    });
  };

  // Add completion status to stacks
  const addCompletionStatus = (stacks) => {
    if (!isAuthenticated) return stacks;
    
    return stacks.map(stack => {
      const stackName = stack.title || stack.name;
      return {
        ...stack,
        isCompleted: completedStacks.includes(stackName),
        hasDeepCompleted: completedStacks.includes(`${stackName} - Deeper Mode`)
      };
    });
  };

  return children({ 
    getAvailableStacks, 
    addCompletionStatus,
    completedStacks, 
    loading,
    isAuthenticated 
  });
};

export default AvailableStacksFilter;
