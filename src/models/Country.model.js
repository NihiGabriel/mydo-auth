const mongoose = require('mongoose');
const slugify = require('slugify');

const CountrySchema = new mongoose.Schema(
    {

        name: {
            type: String,
        },

        code2: {
            type: String,
            required: [false, 'Country code in two letters is required']
        },

        code3: {
            type: String,
            required: [false, 'Country code in three letters is required']
        },

        capital: {
            type: String,
            required: [false, 'capital is required']
        },

        region: {
            type: String,
            required: [false, 'Region is region']
        },

        subRegion: {
            type: String,
            required: [false, 'sub region is required']
        },

        currencyCode: {
            type: String,
            required: [false, 'currency code is required']
        },

        currencyImage: {
            type: String,
            required: [false, 'currency image is required']
        },

        phoneCode: {
            type: String,
            required: [false, 'phone code is required']
        },

        flag: {
            type: String,
            required: [false, 'flag is required']
        },

        states: [],

        slug: String

    },

    {

        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
            }
        }

    }
)

CountrySchema.set('toJSON', {getters: true, virtuals: true});

CountrySchema.pre('save', function (next){
    this.slug = slugify(this.name, { lower: true });

    next();
})

CountrySchema.statics.findByName = function (roleName) {
    return this.findOne({name: roleName});
}

CountrySchema.statics.findByCode = function (code) {
    return this.findOne({phoneCode: code});
}
CountrySchema.statics.getCountry = function (id) {
    return this.findById({id});
}

module.exports = mongoose.model('Country', CountrySchema)