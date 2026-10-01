import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Linking } from 'react-native';
import { Pressable, SafeAreaView, ScrollView, Text, View } from '@ng-native/components';
import { injectScenarioRoute } from './deep-link';
import { ScenarioComponent } from './scenario.component';
import { SUITES } from './scenarios';

@Component({
  selector: 'app-root',
  imports: [SafeAreaView, ScrollView, View, Text, Pressable, ScenarioComponent],
  template: `
    <safe-area-view class="screen">
      <scroll-view class="scroll" keyboardShouldPersistTaps="handled">
        <view class="body">
          @if (scenario(); as scenario) {
            <!-- Keyed by id, so a new link mounts a fresh form. -->
            @for (s of [scenario]; track s.testId) {
              <app-scenario [scenario]="s" />
            }
          } @else {
            <text class="title" testID="test-index">ng-forge native e2e</text>
            @for (suite of suites; track suite.id) {
              <text class="suite">{{ suite.title }}</text>
              @for (s of suite.scenarios; track s.testId) {
                <pressable class="link" role="link" (press)="open(suite.id, s.testId)">
                  <text class="link-label">{{ s.title }}</text>
                </pressable>
              }
            }
          }
        </view>
      </scroll-view>
    </safe-area-view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .screen {
      flex: 1;
      background-color: #ffffff;
    }
    .scroll {
      flex: 1;
    }
    .body {
      padding: 16px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2328;
      margin-bottom: 12px;
    }
    .suite {
      font-size: 16px;
      font-weight: 600;
      color: #1f2328;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    .link {
      padding: 8px 0;
    }
    .link-label {
      font-size: 15px;
      color: #0969da;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly suites = SUITES;
  private readonly route = injectScenarioRoute();

  protected readonly scenario = computed(() => {
    const route = this.route();
    return SUITES.find((s) => s.id === route?.suiteId)?.scenarios.find((s) => s.testId === route?.testId) ?? null;
  });

  protected open(suiteId: string, testId: string): void {
    void Linking.openURL(`ngforge-e2e://test/${suiteId}/${testId}`);
  }
}
