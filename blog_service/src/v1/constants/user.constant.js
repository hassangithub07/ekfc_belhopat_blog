const customerProject = {
    first_name: 1,
    last_name: 1,
    user_name: 1,
    image_url: 1,
    country_code: 1,
    phone_number: 1,
    full_number: 1,
    color_code: 1,
    is_private_account: 1,
    bio: 1
}

const followProject = {
    following_id: 1,
    follower_id: 1,
    status: 1
}

const colorCodes = ['#4527A0','#2E7D32','#006064','#558B2F','#C62828','#00695C','#4CAF50',
'#4E342E','#37474F','#E65100','#AFB42B','#F57F17','#3949AB','#AD1457','#5D4037','#455A64','#283593',
'#01579B','#D84315','#689F38','#F57C00','#00BFA5']

module.exports = {
    customerProject,
    colorCodes,
    followProject
};