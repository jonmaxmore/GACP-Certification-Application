import mongoose, { Schema, Document } from 'mongoose';

export interface IEstablishment extends Document {
    owner: mongoose.Types.ObjectId;
    name: string;
    type: 'farm' | 'shop' | 'extraction' | 'export' | 'research';
    address: {
        no?: string;
        moo?: string;
        soi?: string;
        road?: string;
        subDistrict?: string;
        district?: string;
        province?: string;
        zipCode?: string;
    };
    coordinates: {
        lat: number;
        lng: number;
    };
    images: string[];
    licenses: string[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EstablishmentSchema: Schema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['farm', 'shop', 'extraction', 'export', 'research'],
            required: true,
        },
        address: {
            no: String,
            moo: String,
            soi: String,
            road: String,
            subDistrict: String,
            district: String,
            province: String,
            zipCode: String,
        },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        images: {
            type: [String],
            default: [],
        },
        licenses: {
            type: [String],
            default: [],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries (optional but good for coordinates)
EstablishmentSchema.index({ coordinates: '2dsphere' });
EstablishmentSchema.index({ owner: 1 });

export default mongoose.model<IEstablishment>('Establishment', EstablishmentSchema);
