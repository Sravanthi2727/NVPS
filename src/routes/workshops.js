router.get('/workshops', async (req, res) => {

  const upcomingWorkshops = await Workshop.find({ date: { $gte: new Date() } });
  const pastWorkshops = await Workshop.find({ date: { $lt: new Date() } });

  res.render('workshops', {
    upcomingWorkshops,
    pastWorkshops
  });

});
