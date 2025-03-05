// Ankush

module.exports = {
    name: 'Student Clubs n Activities',
    publisher: 'Pansoft Card Contest',
    cards: [{
        type: 'Student Clubs n Activities',
        source: './src/cards/StudentClubs.jsx',
        title: 'Student Clubs n Activities',
        displayCardType: 'Student Clubs n Activities',
        description: 'Student Clubs n Activities',
        configuration: {
            client: [{
                key: 'clubLimit',
                label: 'No Of Club Activity allowed',
                type: 'text',
                required: true
            },
            {
                key: 'clubCategory',
                label: 'Activity Category for Clubs',
                type: 'text',
                required: true
            },            
            {
                key: 'clubFees',
                label: 'Fee for joining Each Club',
                type: 'text',
                required: true
            }],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API Key',
                type: 'password',
                require: true,
                default:'6020297c-8506-4f23-b2db-6c95dc0f0bee'
            }]
        }
    }]
}
