// SentimentAnalyzer.ts
export class SentimentAnalyzer {
    private positiveWords = [
        'good',
        'great',
        'excellent',
        'amazing',
        'wonderful',
        'perfect',
        'nice',
        'love',
        'like',
        'delicious',
    ];
    private negativeWords = [
        'bad',
        'terrible',
        'awful',
        'horrible',
        'disgusting',
        'hate',
        'poor',
        'dislike',
        'not good',
    ];

    analyze(comment: string): string {
        const words = comment.toLowerCase().split(/\W+/);
        let positiveCount = 0;
        let negativeCount = 0;

        for (const word of words) {
            if (this.positiveWords.includes(word)) {
                positiveCount++;
            } else if (this.negativeWords.includes(word)) {
                negativeCount++;
            }
        }

        if (positiveCount > negativeCount) {
            return 'pos';
        } else if (negativeCount > positiveCount) {
            return 'neg';
        } else {
            return 'neutral';
        }
    }
}
