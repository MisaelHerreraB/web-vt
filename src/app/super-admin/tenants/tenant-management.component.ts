import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { PlanService, Plan } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { TenantService, CreateFullTenantDto } from '../../services/tenant.service';
import { CURRENCIES, Currency } from '../../constants/currencies';
import { RUNTIME_CONFIG } from '../../config/runtime-config';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  currentPlan: string;
  planExpiresAt: Date | null;
  createdAt: Date;
}

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Manage Stores</h1>
            <button (click)="openCreateModal()" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm">
              + Create Store
            </button>
        </div>
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">All Stores ({{ tenants.length }})</h2>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Expires</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let tenant of tenants">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ tenant.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ tenant.slug }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{{ tenant.currentPlan }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span *ngIf="tenant.planExpiresAt" [class]="isExpiringSoon(tenant.planExpiresAt) ? 'text-red-600 font-semibold' : 'text-gray-900'">
                      {{ tenant.planExpiresAt | date:'short' }}
                    </span>
                    <span *ngIf="!tenant.planExpiresAt" class="text-gray-400">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span [class]="tenant.isActive ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800' : 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'">
                      {{ tenant.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ tenant.createdAt | date:'short' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button (click)="openChangePlanModal(tenant)" class="text-blue-600 hover:text-blue-900">Change Plan</button>
                    <button (click)="toggleStatus(tenant)" 
                            [class]="tenant.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'">
                      {{ tenant.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <a [href]="'/' + tenant.slug" target="_blank" class="text-indigo-600 hover:text-indigo-900">View</a>
                    <button (click)="deleteTenant(tenant)" class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Change Plan Modal -->
        <div *ngIf="showChangePlanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Change Plan for {{ selectedTenant?.name }}</h3>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                <select [(ngModel)]="selectedPlanId" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">-- Select a Plan --</option>
                  <option *ngFor="let plan of availablePlans" [value]="plan.id">
                    {{ plan.displayName }} ({{ plan.priceMonthly | currency:'USD' }}/mo)
                  </option>
                </select>
              </div>
              <div class="flex justify-end gap-3">
                <button (click)="closeChangePlanModal()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Cancel
                </button>
                <button (click)="confirmChangePlan()" 
                        [disabled]="!selectedPlanId"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300">
                  Assign Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Tenant Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-6 border w-[500px] shadow-lg rounded-md bg-white">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Create New Store</h3>
            
            <div class="space-y-4">
              <!-- Store Details -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Store Name</label>
                <input [(ngModel)]="newTenant.name" (ngModelChange)="generateSlug()" type="text" 
                       class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Store Slug (URL)</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    http://.../
                  </span>
                  <input [(ngModel)]="newTenant.slug" type="text" 
                         class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 sm:text-sm">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Currency</label>
                <select [(ngModel)]="newTenant.currency" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option *ngFor="let c of currencies" [value]="c.code">{{ c.name }} ({{ c.code }}) - {{ c.symbol }}</option>
                </select>
              </div>

              <!-- Admin User -->
              <div class="border-t border-gray-200 pt-4 mt-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Admin User</h4>
                <div class="grid grid-cols-1 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Admin Name</label>
                    <input [(ngModel)]="newTenant.adminName" type="text" 
                           class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input [(ngModel)]="newTenant.adminEmail" type="email" 
                           class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input [(ngModel)]="newTenant.adminPassword" type="password" 
                           class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  </div>
                </div>
              </div>

              <!-- Plan Selection -->
              <div class="border-t border-gray-200 pt-4 mt-4">
                 <h4 class="text-sm font-semibold text-gray-900 mb-2">Initial Plan</h4>
                 <select [(ngModel)]="newTenant.planId" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">-- Select Plan --</option>
                    <option *ngFor="let plan of availablePlans" [value]="plan.id">
                      {{ plan.displayName }}
                    </option>
                 </select>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4">
                <button (click)="closeCreateModal()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Cancel
                </button>
                <button (click)="createTenant()" 
                        [disabled]="!isValidCreateForm()"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300">
                  Create Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

  `
})
export class TenantManagementComponent implements OnInit {
  tenants: Tenant[] = [];
  userEmail = '';
  private apiUrl = inject(RUNTIME_CONFIG).apiUrl;

  // Modal state
  showChangePlanModal = false;
  selectedTenant: Tenant | null = null;
  selectedPlanId = '';
  selectedBillingCycle: 'monthly' | 'annual' = 'monthly';
  availablePlans: Plan[] = [];
  currencies = CURRENCIES;

  // Create Modal State
  showCreateModal = false;
  newTenant: CreateFullTenantDto = {
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
    planId: '',
    currency: 'PEN'
  };

  constructor(
    private http: HttpClient, // Keeping for legacy/direct calls if needed
    private authService: AuthService,
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
    private tenantService: TenantService,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
  }

  ngOnInit() {
    this.loadTenants();
    this.loadPlans();
  }

  loadTenants() {
    this.http.get<Tenant[]>(`${this.apiUrl}/tenants`).subscribe({
      next: (data) => {
        this.tenants = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading tenants:', err)
    });
  }

  loadPlans() {
    this.planService.getActivePlans().subscribe({
      next: (data) => {
        this.availablePlans = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading plans:', err)
    });
  }

  openChangePlanModal(tenant: Tenant) {
    this.selectedTenant = tenant;
    this.selectedPlanId = '';
    this.selectedBillingCycle = 'monthly';
    this.showChangePlanModal = true;
  }

  closeChangePlanModal() {
    this.showChangePlanModal = false;
    this.selectedTenant = null;
    this.selectedPlanId = '';
  }

  confirmChangePlan() {
    if (!this.selectedTenant || !this.selectedPlanId) {
      return;
    }

    this.subscriptionService.assignPlan({
      tenantId: this.selectedTenant.id,
      planId: this.selectedPlanId,
      billingCycle: this.selectedBillingCycle
    }).subscribe({
      next: () => {
        alert('Plan changed successfully!');
        this.closeChangePlanModal();
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error changing plan:', err);
        alert('Failed to change plan. Please try again.');
      }
    });
  }

  isExpiringSoon(expiresAt: Date | null): boolean {
    if (!expiresAt) return false;
    const expires = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }

  toggleStatus(tenant: Tenant) {
    if (confirm(`Are you sure you want to ${tenant.isActive ? 'deactivate' : 'activate'} ${tenant.name}?`)) {
      this.http.patch(`${this.apiUrl}/tenants/${tenant.id}/toggle`, {}).subscribe({
        next: () => this.loadTenants(),
        error: (err) => console.error('Error toggling status:', err)
      });
    }
  }

  deleteTenant(tenant: Tenant) {
    if (confirm(`Are you sure you want to DELETE ${tenant.name}? This action cannot be undone.`)) {
      this.http.delete(`${this.apiUrl}/tenants/${tenant.id}`).subscribe({
        next: () => this.loadTenants(),
        error: (err) => console.error('Error deleting tenant:', err)
      });
    }
  }

  // Create Tenant Methods
  openCreateModal() {
    this.newTenant = {
      name: '',
      slug: '',
      adminEmail: '',
      adminPassword: '',
      adminName: '',
      planId: ''
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  generateSlug() {
    this.newTenant.slug = this.newTenant.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  isValidCreateForm(): boolean {
    return !!(
      this.newTenant.name &&
      this.newTenant.slug &&
      this.newTenant.adminEmail &&
      this.newTenant.adminPassword &&
      this.newTenant.adminName &&
      this.newTenant.planId &&
      this.newTenant.currency
    );
  }

  createTenant() {
    if (!this.isValidCreateForm()) return;

    this.tenantService.createTenantWithUser(this.newTenant).subscribe({
      next: () => {
        alert('Store created successfully!');
        this.closeCreateModal();
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error creating store:', err);
        alert(err.error?.message || 'Failed to create store');
      }
    });
  }


}
