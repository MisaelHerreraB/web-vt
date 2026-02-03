import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanService, Plan } from '../../services/plan.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
    <div class="min-h-screen bg-gray-100">
      <!-- Header removed (handled by layout) -->

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Available Plans ({{ plans.length }})</h2>
          <p class="text-sm text-gray-600 mb-4">Manage subscription plans. You can activate or deactivate plans individually. Inactive plans cannot be assigned to new tenants.</p>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (Monthly)</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (Annual)</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Products</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let plan of plans" [class.opacity-50]="!plan.isActive">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ plan.displayName }}</div>
                    <div class="text-xs text-gray-500">{{ plan.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ plan.priceMonthly | currency:'USD' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span>{{ plan.priceAnnual | currency:'USD' }}</span>
                    <span *ngIf="plan.priceAnnual > 0 && plan.priceMonthly > 0" class="ml-2 text-xs text-green-600">
                      (50% off)
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ plan.maxProducts === null ? 'Unlimited' : plan.maxProducts }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    <ul class="list-disc list-inside text-xs">
                      <li *ngFor="let feature of plan.features">{{ feature }}</li>
                    </ul>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span [class]="plan.isActive ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800' : 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'">
                      {{ plan.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button (click)="toggleStatus(plan)" 
                            [class]="plan.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'">
                      {{ plan.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Plan Details Cards -->
        <div class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Plan Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let plan of plans" 
                 class="bg-white rounded-lg shadow p-6"
                 [class.border-2]="plan.isActive"
                 [class.border-blue-500]="plan.isActive">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-xl font-bold text-gray-900">{{ plan.displayName }}</h4>
                <span [class]="plan.isActive ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800' : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'">
                  {{ plan.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="mb-4">
                <div class="text-3xl font-bold text-gray-900">
                  {{ plan.priceMonthly | currency:'USD' }}
                  <span class="text-sm font-normal text-gray-500">/month</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  or {{ plan.priceAnnual | currency:'USD' }}/year (save 50%)
                </div>
              </div>
              <div class="border-t pt-4">
                <ul class="space-y-2">
                  <li *ngFor="let feature of plan.features" class="flex items-start">
                    <svg class="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-sm text-gray-600">{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class PlansListComponent implements OnInit {
  plans: Plan[] = [];

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadPlans();
  }


  loadPlans() {
    // Try to get all plans (including inactive) if user is super admin
    this.planService.getAllPlans().subscribe({
      next: (data) => {
        console.log('Plans loaded (all):', data);
        this.plans = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading all plans, trying active plans only:', err);
        // Fallback to active plans if unauthorized
        this.planService.getActivePlans().subscribe({
          next: (data) => {
            console.log('Plans loaded (active only):', data);
            this.plans = data;
            this.cdr.detectChanges();
          },
          error: (err2) => console.error('Error loading active plans:', err2)
        });
      }
    });
  }


  toggleStatus(plan: Plan) {
    const action = plan.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} the plan "${plan.displayName}"? ${!plan.isActive ? 'This will make it available for assignment to tenants.' : 'Inactive plans cannot be assigned to new tenants.'}`)) {
      this.planService.togglePlanStatus(plan.id).subscribe({
        next: () => this.loadPlans(),
        error: (err) => console.error('Error toggling plan status:', err)
      });
    }
  }


}
