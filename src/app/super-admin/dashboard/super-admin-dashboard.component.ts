import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-500">Total Stores</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalStores }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-500">Active Stores</div>
        <div class="mt-2 text-3xl font-bold text-green-600">{{ stats.activeStores }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-500">Total Users</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-500">Total Products</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalProducts }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a routerLink="/super-admin/tenants" class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer block">
            <div class="text-lg font-medium text-gray-900">Manage Stores</div>
            <div class="text-sm text-gray-500 mt-1">View and manage all tenant stores</div>
          </a>
          <a routerLink="/super-admin/users" class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer block">
            <div class="text-lg font-medium text-gray-900">Manage Users</div>
            <div class="text-sm text-gray-500 mt-1">View and manage all platform users</div>
          </a>
          <a routerLink="/super-admin/plans" class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer block">
            <div class="text-lg font-medium text-gray-900">Manage Plans</div>
            <div class="text-sm text-gray-500 mt-1">Configure subscription plans and pricing</div>
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8 bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      <div class="p-6">
        <p class="text-gray-500 text-center py-8">No recent activity to display</p>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent {
  userEmail = '';
  stats = {
    totalStores: 1,
    activeStores: 1,
    totalUsers: 2,
    totalProducts: 50
  };

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
  }
}
