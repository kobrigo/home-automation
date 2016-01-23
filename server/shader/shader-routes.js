module.exports.init = function (app) {
    // returns a list of all the schedules for the shader
    app.get('/sharder/schedules', function (req, res) {
        res.send([
            {
                id: 0,
                onDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                startAtTime: '07:00:00',
                duration: '00:15:00',
                fireTickEveryMls: 200,
                eventName: 'OpenShade',
                enabled: true
            },
            {
                id: 1,
                onDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                startAtTime: '10:00:00',
                duration: '00:15:00',
                fireTickEveryMls: 200,
                eventName: 'CloseShade',
                enabled: true
            },
            {
                id: 2,
                onDays: ['Friday','Saturday'],
                startAtTime: '11:00:00',
                duration: '00:15:00',
                fireTickEveryMls: 200,
                eventName: 'OpenShade',
                enabled: true
            },
            {
                id: 3,
                onDays: ['Friday','Saturday'],
                startAtTime: '12:00:00',
                duration: '00:15:00',
                fireTickEveryMls: 200,
                eventName: 'CloseShade',
                enabled: true
            }

        ]);
    });

    app.update('/sharder/schedules/:id', function (req, res) {

    });
};
