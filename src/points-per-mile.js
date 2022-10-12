

export const getPointsEarned = (dock1, dock2) => {
  if (dock1.bike_angels_action === 'give' || dock2.bike_angels_action === 'take') {
    return 0;
  }
  return dock1.bike_angels_points + dock2.bike_angels_points;
};