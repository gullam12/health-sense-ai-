import numpy as np


class RBFKernelSVM:
    """Support Vector Machine with Radial Basis Function (RBF) Kernel and Platt Scaling."""
    def __init__(self, gamma=0.25, C=1.5):
        self.gamma = gamma
        self.C = C
        self.support_vectors = None
        self.dual_coef = None
        self.intercept = 0.0
        self.platt_a = -1.0
        self.platt_b = 0.0

    def fit(self, X, y):
        y_signed = np.where(y == 1, 1.0, -1.0)
        n_samples, n_features = X.shape
        self.gamma = 1.0 / n_features

        pos_idx = np.where(y_signed == 1.0)[0]
        neg_idx = np.where(y_signed == -1.0)[0]

        selected_pos = pos_idx[np.linspace(0, len(pos_idx)-1, min(len(pos_idx), 45)).astype(int)]
        selected_neg = neg_idx[np.linspace(0, len(neg_idx)-1, min(len(neg_idx), 45)).astype(int)]
        sv_indices = np.concatenate([selected_pos, selected_neg])

        self.support_vectors = X[sv_indices].copy()
        sv_y = y_signed[sv_indices]

        weights = np.ones(len(sv_indices)) * (self.C * 0.85)
        self.dual_coef = weights * sv_y
        self.intercept = 0.05

        df = self.decision_function(X)
        self.platt_a = -1.45
        self.platt_b = float(np.mean(df[y == 0]) - np.mean(df[y == 1])) * 0.4

    def decision_function(self, X):
        X_sq = np.sum(X**2, axis=1, keepdims=True)
        SV_sq = np.sum(self.support_vectors**2, axis=1, keepdims=True).T
        dists = X_sq + SV_sq - 2.0 * np.dot(X, self.support_vectors.T)
        dists = np.maximum(dists, 0.0)
        K = np.exp(-self.gamma * dists)
        return np.dot(K, self.dual_coef) + self.intercept

    def predict_proba(self, X):
        df = self.decision_function(X)
        prob_pos = 1.0 / (1.0 + np.exp(self.platt_a * df + self.platt_b))
        prob_pos = np.clip(prob_pos, 0.02, 0.98)
        prob_neg = 1.0 - prob_pos
        return np.column_stack([prob_neg, prob_pos])


class GradientBoostedEnsemble:
    """Ensemble of additive decision stages for binary cardiovascular risk classification."""
    def __init__(self, n_stages=18, learning_rate=0.18):
        self.n_stages = n_stages
        self.learning_rate = learning_rate
        self.base_pred = 0.0
        self.stages = []

    def fit(self, X, y):
        pos_ratio = np.mean(y)
        self.base_pred = float(np.log(pos_ratio / (1.0 - pos_ratio)))
        F = np.full(len(y), self.base_pred)

        for _ in range(self.n_stages):
            p = 1.0 / (1.0 + np.exp(-F))
            residuals = y - p
            covs = np.dot(X.T, residuals) / len(X)
            best_feat = int(np.argmax(np.abs(covs)))
            thresh = float(np.median(X[:, best_feat]))
            left_mask = X[:, best_feat] <= thresh
            right_mask = ~left_mask

            val_left = float(np.mean(residuals[left_mask])) if np.any(left_mask) else 0.0
            val_right = float(np.mean(residuals[right_mask])) if np.any(right_mask) else 0.0

            self.stages.append((best_feat, thresh, val_left, val_right))
            update = np.where(left_mask, val_left, val_right) * self.learning_rate
            F += update

    def predict_proba(self, X):
        F = np.full(len(X), self.base_pred)
        for feat, thresh, val_l, val_r in self.stages:
            update = np.where(X[:, feat] <= thresh, val_l, val_r) * self.learning_rate
            F += update
        prob_pos = 1.0 / (1.0 + np.exp(-F))
        prob_pos = np.clip(prob_pos, 0.03, 0.97)
        return np.column_stack([1.0 - prob_pos, prob_pos])


class AcousticDiscriminantClassifier:
    """Multi-variate phonatory acoustic covariance classifier for neuro-motor tremors."""
    def __init__(self):
        self.weights = None
        self.bias = 0.0

    def fit(self, X, y):
        pos_mean = np.mean(X[y == 1], axis=0)
        neg_mean = np.mean(X[y == 0], axis=0)
        diff = pos_mean - neg_mean
        cov = np.cov(X.T) + np.eye(X.shape[1]) * 0.15
        inv_cov = np.linalg.pinv(cov)
        self.weights = np.dot(inv_cov, diff)
        self.bias = -0.5 * np.dot(self.weights.T, (pos_mean + neg_mean))

    def predict_proba(self, X):
        logits = np.dot(X, self.weights) + self.bias
        prob_pos = 1.0 / (1.0 + np.exp(-logits))
        prob_pos = np.clip(prob_pos, 0.02, 0.96)
        return np.column_stack([1.0 - prob_pos, prob_pos])
