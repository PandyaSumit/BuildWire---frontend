import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

type Coordinates = { lat: number; lng: number };

interface AnalysisFields {
  constructionScore?: number;
  investmentRating?: string;
  riskScore?: number;
  roadConnectivity?: number;
  appreciationRate?: string;
  bestUseCase?: string;
  zoningClassification?: string;
  permitComplexity?: string;
  utilityProximity?: string;
  transportAccess?: string;
  amenityDensity?: string;
  farLimit?: string;
  estimatedCostRange?: string;
  projectedROI?: { threeYear?: string; fiveYear?: string; tenYear?: string };
  riskAdjustedReturn?: string;
  permittedTypes?: string[];
  summary?: string;
  recommendations?: string[];
}

interface AnalysisGeodata {
  hospitals?: number;
  schools?: number;
  transitStops?: number;
  majorRoads?: number;
  elevationM?: number;
  earthquakesNearby?: number;
}

export interface AnalysisItem {
  _id?: string;
  address?: string;
  coordinates?: Coordinates;
  geodata?: AnalysisGeodata;
  analysis?: AnalysisFields;
  createdAt?: string;
}

interface AiMapState {
  history: AnalysisItem[];
  selectedAnalysis: AnalysisItem | null;
  analyzing: boolean;
  loadingHistory: boolean;
  error: string | null;
}

const BASE = (orgId: string) => `/organizations/${orgId}/ai-map`;

const extractError = (err: unknown, fallback: string): string => {
  const error = err as { response?: { data?: { error?: string; message?: string } } };
  return error.response?.data?.error || error.response?.data?.message || fallback;
};

export const analyzeLocation = createAsyncThunk(
  'aiMap/analyze',
  async (
    {
      orgId,
      lat,
      lng,
      address,
    }: { orgId: string; lat: number; lng: number; address?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`${BASE(orgId)}/analyze`, { lat, lng, address });
      return res.data.data as { analysis: AnalysisItem };
    } catch (err) {
      return rejectWithValue(extractError(err, 'Analysis failed'));
    }
  }
);

export const fetchAnalysisHistory = createAsyncThunk(
  'aiMap/fetchHistory',
  async ({ orgId }: { orgId: string }, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE(orgId)}/history`);
      return res.data.data as { analyses?: AnalysisItem[] };
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to fetch history'));
    }
  }
);

export const deleteAnalysis = createAsyncThunk(
  'aiMap/delete',
  async ({ orgId, analysisId }: { orgId: string; analysisId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE(orgId)}/${analysisId}`);
      return analysisId;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to delete analysis'));
    }
  }
);

const initialState: AiMapState = {
  history: [],
  selectedAnalysis: null,
  analyzing: false,
  loadingHistory: false,
  error: null,
};

const aiMapSlice = createSlice({
  name: 'aiMap',
  initialState,
  reducers: {
    selectAnalysis(state, action: { payload: AnalysisItem }) {
      state.selectedAnalysis = action.payload;
    },
    clearSelected(state) {
      state.selectedAnalysis = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeLocation.pending, (state) => {
        state.analyzing = true;
        state.error = null;
        state.selectedAnalysis = null;
      })
      .addCase(analyzeLocation.fulfilled, (state, action) => {
        state.analyzing = false;
        state.selectedAnalysis = action.payload.analysis;
        state.history.unshift(action.payload.analysis);
      })
      .addCase(analyzeLocation.rejected, (state, action) => {
        state.analyzing = false;
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(fetchAnalysisHistory.pending, (state) => {
        state.loadingHistory = true;
      })
      .addCase(fetchAnalysisHistory.fulfilled, (state, action) => {
        state.loadingHistory = false;
        state.history = action.payload.analyses || [];
      })
      .addCase(fetchAnalysisHistory.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(deleteAnalysis.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => item._id !== action.payload);
        if (state.selectedAnalysis?._id === action.payload) {
          state.selectedAnalysis = null;
        }
      })
      .addCase(deleteAnalysis.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || null;
      });
  },
});

export const { selectAnalysis, clearSelected, clearError } = aiMapSlice.actions;
export default aiMapSlice.reducer;
